"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  Star,
  MapPin,
  Plus,
  Trash2,
  FolderPlus,
  Clock,
  ArrowRight,
  X,
  ChevronRight,
  Folders,
  History,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSavedBusinesses } from "@/hooks/useSavedBusinesses";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import {
  getLiveOpeningStatus,
  LiveStatusResult,
} from "@/lib/utils/opening-hours";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { getBusinessCardLocation } from "@/lib/utils/business-location";
import { Business } from "@/types/business";
import { WriteReviewModal } from "@/components/business/WriteReviewModal";


const EMOJI_OPTIONS = ["❤️", "🔖", "🍽️", "🏥", "🛍️", "☕", "💼", "🏋️", "🎉", "📚"];

export default function SavedPage() {
  const { collections, toggleSave, addCollection, deleteCollection, moveToCollection } =
    useSavedBusinesses();
  const { businesses: recentlyViewed, clearHistory } = useRecentlyViewed();

  const [activeTab, setActiveTab] = useState<"saved" | "recent" | "recommendations">(
    "saved"
  );
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionEmoji, setNewCollectionEmoji] = useState("🔖");

  const [reviewBusiness, setReviewBusiness] = useState<Business | null>(null);

  const [allBusinesses, setAllBusinesses] = useState<Business[]>(SEED_BUSINESSES);

  useEffect(() => {
    // 1. Fetch live favorites directly from API to ensure any newly added custom businesses are hydrated
    fetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0) {
          setAllBusinesses((prev) => {
            const map = new Map(prev.map((b) => [b.id, b]));
            data.businesses.forEach((b: Business) => map.set(b.id, b));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    // 2. Fetch general directory businesses for exploration and recommendations
    fetch("/api/businesses?limit=100")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0) {
          setAllBusinesses((prev) => {
            const map = new Map(prev.map((b) => [b.id, b]));
            data.businesses.forEach((b: Business) => {
              if (!map.has(b.id)) map.set(b.id, b);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch any missing saved IDs dynamically
  const allCollectionIds = useMemo(
    () => Array.from(new Set(collections.flatMap((c) => c.businessIds))),
    [collections]
  );

  useEffect(() => {
    const missingIds = allCollectionIds.filter((id) => !allBusinesses.some((b) => b.id === id));
    if (missingIds.length > 0) {
      fetch(`/api/businesses?ids=${encodeURIComponent(missingIds.join(","))}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.businesses && Array.isArray(data.businesses)) {
            setAllBusinesses((prev) => {
              const map = new Map(prev.map((b) => [b.id, b]));
              data.businesses.forEach((b: Business) => map.set(b.id, b));
              return Array.from(map.values());
            });
          }
        })
        .catch(() => {});
    }
  }, [allCollectionIds, allBusinesses]);


  // Hydrate collection businesses from live data
  const hydratedCollections = useMemo(() => {
    return collections.map((col) => ({
      ...col,
      businesses: col.businessIds
        .map((id) => allBusinesses.find((b) => b.id === id))
        .filter((b): b is Business => Boolean(b)),
    }));
  }, [collections, allBusinesses]);

  // Collections populated purely with user's real saved places
  const displayCollections = hydratedCollections;

  const activeCol = displayCollections.find((c) => c.id === activeCollection);
  const displayBusinesses = useMemo(() => {
    const list =
      activeCollection && activeCol
        ? activeCol.businesses
        : displayCollections.flatMap((c) => c.businesses);
    const seen = new Set<string>();
    return list.filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [activeCollection, activeCol, displayCollections]);

  // Recommendations: highly rated businesses not already saved
  const savedIds = new Set(collections.flatMap((c) => c.businessIds));
  const recommendations = allBusinesses.filter(
    (b) => !savedIds.has(b.id) && b.ratingAvg >= 4.0
  ).slice(0, 6);

  const handleAddCollection = () => {
    if (!newCollectionName.trim()) return;
    addCollection(newCollectionName.trim(), newCollectionEmoji);
    setNewCollectionName("");
    setNewCollectionEmoji("🔖");
    setIsAddCollectionOpen(false);
  };

  const totalSaved = displayCollections.reduce(
    (sum, c) => sum + c.businesses.length,
    0
  );

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 min-h-screen py-3 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 pb-4 sm:pb-5 border-b border-border">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[9px] sm:text-[11px] font-bold mb-1 sm:mb-1.5 border border-red-200 dark:border-red-800">
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                My Places
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight leading-tight">
                Saved & Bookmarked
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {totalSaved} saved place{totalSaved !== 1 ? "s" : ""} across{" "}
                {collections.length} collection{collections.length !== 1 ? "s" : ""}
              </p>
            </div>

          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-0.5 sm:gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-border overflow-x-auto no-scrollbar">
            {[
              { id: "saved", label: "Saved", icon: Bookmark },
              { id: "recent", label: "Recent", icon: History },
              { id: "recommendations", label: "For You", icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === id
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB: Saved Collections ──────────────────────────────── */}
        {activeTab === "saved" && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">

              {/* Collections Panel */}
              <div className="lg:w-56 xl:w-60 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Collections
                  </h3>
                  <button
                    onClick={() => setIsAddCollectionOpen(true)}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                    title="New Collection"
                  >
                    <FolderPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>

                {/* Horizontal scroll on mobile, vertical list on lg+ */}
                <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                  {/* All saved */}
                  <button
                    onClick={() => setActiveCollection(null)}
                    className={`shrink-0 lg:w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                      activeCollection === null
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Folders className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">All Saved</span>
                    </span>
                    <span className="text-[9px] opacity-70">{totalSaved}</span>
                  </button>

                  {displayCollections.map((col) => (
                    <div key={col.id} className="group relative shrink-0 lg:w-full">
                      <button
                        onClick={() => setActiveCollection(col.id)}
                        className={`w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                          activeCollection === col.id
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "hover:bg-accent text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm">{col.emoji}</span>
                          <span className="truncate max-w-[80px] sm:max-w-none">{col.name}</span>
                        </span>
                        <span className="text-[9px] opacity-70">{col.businesses.length}</span>
                      </button>

                      {col.id !== "col-favorites" && col.id !== "col-want-to-try" && (
                        <button
                          onClick={() => {
                            deleteCollection(col.id);
                            if (activeCollection === col.id) setActiveCollection(null);
                          }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition-all"
                        >
                          <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Collection inline form */}
                {isAddCollectionOpen && (
                  <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card space-y-2 mt-2 shadow-sm">
                    <p className="text-[9px] sm:text-[10px] font-black text-foreground">
                      New Collection
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          onClick={() => setNewCollectionEmoji(em)}
                          className={`text-xs sm:text-sm p-1 rounded-lg transition-all ${
                            newCollectionEmoji === em
                              ? "bg-primary/20 scale-110"
                              : "hover:bg-accent"
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Collection name..."
                      className="h-7 sm:h-8 text-[10px] sm:text-xs rounded-lg"
                      onKeyDown={(e) => e.key === "Enter" && handleAddCollection()}
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="gradient"
                        className="flex-1 h-6 sm:h-7 text-[9px] sm:text-[10px] font-bold rounded-lg"
                        onClick={handleAddCollection}
                      >
                        Create
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 sm:h-7 text-[9px] sm:text-[10px] rounded-lg"
                        onClick={() => setIsAddCollectionOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Grid */}
              <div className="flex-1 min-w-0">
                {displayBusinesses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl p-4">
                    <Bookmark className="w-7 h-7 sm:w-9 sm:h-9 mb-2 sm:mb-3 text-slate-300 dark:text-slate-700" />
                    <p className="font-bold text-xs sm:text-sm text-foreground">
                      No saved places yet
                    </p>
                    <p className="text-[10px] sm:text-xs mt-1 max-w-xs">
                      Tap the heart icon on any business profile to save it here.
                    </p>
                    <Link href="/search" className="mt-3">
                      <Button size="sm" variant="gradient" className="h-7 sm:h-8 text-[10px] sm:text-xs gap-1.5 font-bold">
                        Explore Businesses <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {displayBusinesses.map((biz) => {
                      const liveStatus = getLiveOpeningStatus(biz.openingHours);
                      return (
                        <BusinessCard
                          key={biz.id}
                          biz={biz}
                          liveStatus={liveStatus}
                          onReview={() => setReviewBusiness(biz)}
                          onUnsave={() => toggleSave(biz.id, biz.name)}
                          collections={displayCollections}
                          onMove={(toId) => {
                            const fromCol = displayCollections.find((c) =>
                              c.businessIds.includes(biz.id)
                            );
                            if (fromCol) moveToCollection(biz.id, fromCol.id, toId);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Recently Viewed ───────────────────────────────── */}
        {activeTab === "recent" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-foreground">
                Recently Viewed
                <span className="ml-1.5 text-[10px] sm:text-xs text-muted-foreground font-normal">
                  ({recentlyViewed.length > 0 ? recentlyViewed.length : allBusinesses.slice(0, 5).length} places)
                </span>
              </h2>
              {recentlyViewed.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-6 sm:h-7 text-[10px] sm:text-xs text-muted-foreground hover:text-red-500 gap-1 px-2"
                >
                  <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
              {(recentlyViewed.length > 0
                ? recentlyViewed
                : allBusinesses.slice(0, 8)
              ).map((biz) => {
                const liveStatus = getLiveOpeningStatus(biz.openingHours);
                return (
                  <Link key={biz.id} href={`/business/${biz.id}`}>
                    <div className="group p-2.5 sm:p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex gap-2 sm:gap-2.5 items-center cursor-pointer">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={biz.coverUrl || "/placeholder-business.jpg"}
                          alt={biz.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[10px] sm:text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {biz.name}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                          {biz.categoryName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge
                            variant={liveStatus.isOpen ? "success" : "destructive"}
                            className="text-[8px] py-0 h-3.5 px-1"
                          >
                            {liveStatus.isOpen ? "Open" : "Closed"}
                          </Badge>
                          <span className="text-[9px] font-bold text-foreground flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            {biz.ratingAvg.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: Recommendations ──────────────────────────────── */}
        {activeTab === "recommendations" && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
                Recommended For You
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                Top-rated businesses you haven't saved yet
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recommendations.map((biz) => {
                const liveStatus = getLiveOpeningStatus(biz.openingHours);
                return (
                  <div
                    key={biz.id}
                    className="group rounded-2xl bg-card border border-border hover:border-primary/40 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={biz.coverUrl || "/placeholder-business.jpg"}
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between">
                        <div>
                          <p className="text-white font-black text-[11px] sm:text-xs line-clamp-1">
                            {biz.name}
                          </p>
                          <p className="text-white/80 text-[9px] sm:text-[10px]">
                            {biz.categoryName}
                          </p>
                        </div>
                        <Badge
                          variant={liveStatus.isOpen ? "success" : "destructive"}
                          className="text-[8px] sm:text-[9px] shrink-0"
                        >
                          {liveStatus.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] sm:text-xs font-black text-foreground">
                            {biz.ratingAvg.toFixed(1)}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-0.5">
                            ({biz.reviewCount})
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-0.5 truncate" title={getBusinessCardLocation(biz)}>
                          <MapPin className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-indigo-400 shrink-0" />
                          {getBusinessCardLocation(biz)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <FavoriteButton
                          businessId={biz.id}
                          businessName={biz.name}
                          businessCity={biz.cityName}
                          businessCountry={biz.countryName}
                          variant="minimal"
                          size="sm"
                        />
                        <Link href={`/business/${biz.id}`}>
                          <Button size="sm" variant="gradient" className="h-6 sm:h-7 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5">
                            View <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewBusiness && (
        <WriteReviewModal
          isOpen={Boolean(reviewBusiness)}
          onClose={() => setReviewBusiness(null)}
          business={reviewBusiness}
          onSubmit={(review) => {
            console.log("Review submitted:", review);
            setReviewBusiness(null);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Business Card sub-component for the Saved grid             */
/* ─────────────────────────────────────────────────────────── */
interface BusinessCardProps {
  biz: Business;
  liveStatus: LiveStatusResult;
  onReview: () => void;
  onUnsave: () => void;
  collections: Array<{ id: string; name: string; emoji: string; businesses: Business[] }>;
  onMove: (toId: string) => void;
}

function BusinessCard({ biz, liveStatus, onReview, onUnsave, collections, onMove }: BusinessCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div className="group rounded-2xl bg-card border border-border/80 hover:border-primary/40 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={biz.coverUrl || "/placeholder-business.jpg"}
          alt={biz.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <Badge
            variant={liveStatus.isOpen ? "success" : "destructive"}
            className="text-[8px] sm:text-[9px] font-bold backdrop-blur-md shadow-sm px-1.5 py-0"
          >
            {liveStatus.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        {/* Unsave button */}
        <button
          onClick={onUnsave}
          className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          title="Remove from saved"
        >
          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-bold text-[11px] sm:text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {biz.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground">
            <span className="font-semibold text-primary text-[9px] sm:text-[10px]">
              {biz.categoryName}
            </span>
            <span>•</span>
            <div className="flex items-center gap-0.5 font-bold text-foreground">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 fill-amber-500" />
              {biz.ratingAvg.toFixed(1)}
            </div>
          </div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 line-clamp-2">
            {biz.shortDescription || biz.description}
          </p>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between gap-1 sm:gap-1.5 mt-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-0.5 sm:gap-1 relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg hover:bg-accent"
              title="Move to collection"
            >
              <Bookmark className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Move
            </button>

            {showMoveMenu && (
              <div className="absolute left-0 top-7 z-20 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[130px] sm:min-w-[150px] space-y-0.5">
                {collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onMove(c.id);
                      setShowMoveMenu(false);
                    }}
                    className="w-full text-left px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold hover:bg-accent transition-colors flex items-center gap-1.5"
                  >
                    <span>{c.emoji}</span> {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={onReview}
              className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-semibold text-muted-foreground hover:text-amber-500 transition-colors px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Review
            </button>
            <Link href={`/business/${biz.id}`}>
              <Button size="sm" variant="gradient" className="h-6 sm:h-6 text-[9px] sm:text-[10px] font-bold px-2">
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
