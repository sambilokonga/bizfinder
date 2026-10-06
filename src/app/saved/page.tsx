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
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import {
  getLiveOpeningStatus,
  LiveStatusResult,
} from "@/lib/utils/opening-hours";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { Business } from "@/types/business";
import { WriteReviewModal } from "@/components/business/WriteReviewModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
  const displayBusinesses =
    activeCollection && activeCol
      ? activeCol.businesses
      : displayCollections.flatMap((c) => c.businesses);

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
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold mb-2 border border-red-200 dark:border-red-800">
              <Heart className="w-3.5 h-3.5 fill-current" />
              My Places
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Saved & Bookmarked
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalSaved} saved place{totalSaved !== 1 ? "s" : ""} across{" "}
              {collections.length} collection{collections.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Tabs & Theme */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="pill" />
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border">
              {[
                { id: "saved", label: "Saved", icon: Bookmark },
                { id: "recent", label: "Recently Viewed", icon: History },
                { id: "recommendations", label: "For You", icon: Sparkles },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === id
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TAB: Saved Collections */}
        {activeTab === "saved" && (
          <div className="space-y-6">
            {/* Collections Sidebar + Business Grid */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Collections Panel */}
              <div className="lg:w-64 shrink-0 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                    Collections
                  </h3>
                  <button
                    onClick={() => setIsAddCollectionOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                    title="New Collection"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* All saved */}
                <button
                  onClick={() => setActiveCollection(null)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeCollection === null
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "hover:bg-accent text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folders className="w-4 h-4" /> All Saved
                  </span>
                  <span className="text-[10px] opacity-70">{totalSaved}</span>
                </button>

                {displayCollections.map((col) => (
                  <div key={col.id} className="group relative">
                    <button
                      onClick={() => setActiveCollection(col.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                        activeCollection === col.id
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{col.emoji}</span>
                        <span className="truncate">{col.name}</span>
                      </span>
                      <span className="text-[10px] opacity-70">
                        {col.businesses.length}
                      </span>
                    </button>

                    {/* Delete collection — only for custom ones */}
                    {col.id !== "col-favorites" && col.id !== "col-want-to-try" && (
                      <button
                        onClick={() => {
                          deleteCollection(col.id);
                          if (activeCollection === col.id) setActiveCollection(null);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-500 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add New Collection inline form */}
                {isAddCollectionOpen && (
                  <div className="p-3 rounded-2xl border border-border bg-card space-y-2.5 mt-2 shadow-sm">
                    <p className="text-[11px] font-black text-foreground">
                      New Collection
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          onClick={() => setNewCollectionEmoji(em)}
                          className={`text-base p-1 rounded-lg transition-all ${
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
                      className="h-8 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleAddCollection()}
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="gradient"
                        className="flex-1 h-7 text-xs font-bold"
                        onClick={handleAddCollection}
                      >
                        Create
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
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
                  <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
                    <Bookmark className="w-10 h-10 mb-3 text-slate-300" />
                    <p className="font-bold text-sm text-foreground">
                      No saved places yet
                    </p>
                    <p className="text-xs mt-1 max-w-xs">
                      Tap the heart icon on any business profile to save it here.
                    </p>
                    <Link href="/search" className="mt-4">
                      <Button size="sm" variant="gradient" className="gap-1.5 font-bold">
                        Explore Businesses <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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

        {/* TAB: Recently Viewed */}
        {activeTab === "recent" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                Recently Viewed ({recentlyViewed.length > 0 ? recentlyViewed.length : allBusinesses.slice(0, 5).length} places)
              </h2>
              {(recentlyViewed.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-red-500 gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </Button>
              )}
            </div>

            {/* Show seed data as demo if no real history */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(recentlyViewed.length > 0
                ? recentlyViewed
                : allBusinesses.slice(0, 8)
              ).map((biz) => {
                const liveStatus = getLiveOpeningStatus(biz.openingHours);
                return (
                  <Link key={biz.id} href={`/business/${biz.id}`}>
                    <div className="group p-3.5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex gap-3 items-center cursor-pointer">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={biz.coverUrl || "/placeholder-business.jpg"}
                          alt={biz.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                          {biz.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {biz.categoryName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant={liveStatus.isOpen ? "success" : "destructive"}
                            className="text-[9px] py-0 h-4"
                          >
                            {liveStatus.isOpen ? "Open" : "Closed"}
                          </Badge>
                          <span className="text-[10px] font-bold text-foreground flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
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

        {/* TAB: Recommendations */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Recommended For You
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top-rated businesses you haven't saved yet
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendations.map((biz) => {
                const liveStatus = getLiveOpeningStatus(biz.openingHours);
                return (
                  <div
                    key={biz.id}
                    className="group rounded-3xl bg-card border border-border hover:border-primary/40 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={biz.coverUrl || "/placeholder-business.jpg"}
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <p className="text-white font-black text-sm line-clamp-1">
                            {biz.name}
                          </p>
                          <p className="text-white/80 text-[11px]">
                            {biz.categoryName}
                          </p>
                        </div>
                        <Badge
                          variant={liveStatus.isOpen ? "success" : "destructive"}
                          className="text-[10px] shrink-0"
                        >
                          {liveStatus.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-foreground">
                            {biz.ratingAvg.toFixed(1)}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ({biz.reviewCount})
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          {biz.districtName || biz.cityName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleSave(biz.id, biz.name)}
                          className="p-2 rounded-xl border border-border hover:border-red-400 hover:text-red-500 transition-all"
                          title="Save"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/business/${biz.id}`}>
                          <Button size="sm" variant="gradient" className="h-8 text-xs font-bold px-3">
                            View <ChevronRight className="w-3 h-3 ml-0.5" />
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
    <div className="group rounded-3xl bg-card border border-border/80 hover:border-primary/40 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={biz.coverUrl || "/placeholder-business.jpg"}
          alt={biz.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge
            variant={liveStatus.isOpen ? "success" : "destructive"}
            className="text-[10px] font-bold backdrop-blur-md shadow-sm"
          >
            {liveStatus.isOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        {/* Unsave button */}
        <button
          onClick={onUnsave}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          title="Remove from saved"
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {biz.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="font-semibold text-primary text-[11px]">
              {biz.categoryName}
            </span>
            <span>•</span>
            <div className="flex items-center gap-0.5 font-bold text-foreground">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {biz.ratingAvg.toFixed(1)}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">
            {biz.shortDescription || biz.description}
          </p>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={() => setShowMoveMenu(!showMoveMenu)}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-accent"
              title="Move to collection"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Move
            </button>

            {showMoveMenu && (
              <div className="absolute left-0 top-8 z-20 bg-card border border-border rounded-2xl shadow-xl p-2 min-w-[160px] space-y-1">
                {collections.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onMove(c.id);
                      setShowMoveMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <span>{c.emoji}</span> {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onReview}
              className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-amber-500 transition-colors px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <Star className="w-3.5 h-3.5" />
              Review
            </button>
            <Link href={`/business/${biz.id}`}>
              <Button size="sm" variant="gradient" className="h-7 text-[11px] font-bold px-2.5">
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
